<?php

namespace AdminBundle\Controller;

use CMEN\GoogleChartsBundle\GoogleCharts\Charts\AreaChart;
use CMEN\GoogleChartsBundle\GoogleCharts\Charts\BarChart;
use CMEN\GoogleChartsBundle\GoogleCharts\Charts\PieChart;
use DemandeBundle\Enum\DemandeEtatEnum;
use DemandeBundle\Enum\DemandeTypeDCEnum;
use DemandeBundle\Enum\DemandeTypeEnum;
use DemandeBundle\Form\DemandeType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Attribute\AttributeBag;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage;
use UserBundle\Entity\User ;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use UserBundle\Repository\UserRepository;
use UserBundle\UserBundle;

class DefaultController extends Controller
{

    public function templateAction()
    {

        $em=$this->getDoctrine()->getManager();
        if ($this->isGranted("ROLE_ADMIN"))
        {
            $nbJuin = (int) $this->demandeParMoisAction("2019-09",null);
            $nb_Juillet = (int) $this->demandeParMoisAction("2019-10",null);
            $nb_Aout = (int) $this->demandeParMoisAction("2019-11",null);
            $nb_September = (int) $this->demandeParMoisAction("2019-12",null);
        }
        else if ($this->isGranted("ROLE_CLIENT"))
        {
            $nbJuin = (int) $this->demandeParMoisAction("2019-09",$this->getUser()->getId());
            $nb_Juillet = (int) $this->demandeParMoisAction("2019-10",$this->getUser()->getId());
            $nb_Aout = (int) $this->demandeParMoisAction("2019-11",$this->getUser()->getId());
            $nb_September = (int) $this->demandeParMoisAction("2019-12",$this->getUser()->getId());
        }
        else if ($this->isGranted("ROLE_LIVREUR"))
        {
            $nbJuin = (int) $this->demandeParMoisAction("2019-09",$this->getUser()->getId());
            $nb_Juillet = (int) $this->demandeParMoisAction("2019-10",$this->getUser()->getId());
            $nb_Aout = (int) $this->demandeParMoisAction("2019-11",$this->getUser()->getId());
            $nb_September = (int) $this->demandeParMoisAction("2019-12",$this->getUser()->getId());
        }




        $area = new AreaChart();
        $area->getData()->setArrayToDataTable([
            ['Mois', 'Demandes'],
            ['Septembre',  $nbJuin],
            ['Octobre',  $nb_Juillet],
            ['Novembre',  $nb_Aout]
        ]);
        $area->getOptions()->setTitle('Courbe de progression des demandes');
        $area->getOptions()->getHAxis()->setTitle('Mois');
        $area->getOptions()->getHAxis()->getTitleTextStyle()->setColor('#333');
        $area->getOptions()->getVAxis()->setMinValue(0);


        $pieChart = new PieChart();
        $connectedUser = $this->getUser();

        if ($this->isGranted("ROLE_ADMIN"))
        {

            $listAchat = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Achat));
            $listRemise = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Remise));
            $listPaiement = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Paiement));
            $listRetour = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Retour));

            $list_C_Remise = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Remise));
            $list_C_Achat = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Achat));
            $list_C_Recuperation = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Recuperation));
            $list_C_Faire = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Faire));
            $list_C_Versement = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Versement));


        }
        else if ($this->isGranted("ROLE_CLIENT"))
        {

            $listAchat = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Achat,'id_client'=>$this->getUser()->getId()));
            $listRemise = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Remise,'id_client'=>$this->getUser()->getId()));
            $listPaiement = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Paiement,'id_client'=>$this->getUser()->getId()));
            $listRetour = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Retour,'id_client'=>$this->getUser()->getId()));

            $list_C_Remise = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Remise,'id_client'=>$this->getUser()->getId()));
            $list_C_Achat = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Achat,'id_client'=>$this->getUser()->getId()));
            $list_C_Recuperation = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Recuperation,'id_client'=>$this->getUser()->getId()));
            $list_C_Faire = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Faire,'id_client'=>$this->getUser()->getId()));
            $list_C_Versement = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Versement,'id_client'=>$this->getUser()->getId()));


        }
        else if ($this->isGranted("ROLE_LIVREUR"))
        {
            $listAchat = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Achat,'id_livreur'=>$this->getUser()->getId()));
            $listRemise = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Remise,'id_livreur'=>$this->getUser()->getId()));
            $listPaiement = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Paiement,'id_livreur'=>$this->getUser()->getId()));
            $listRetour = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Retour,'id_livreur'=>$this->getUser()->getId()));


            $list_C_Remise = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Remise,'id_livreur'=>$this->getUser()->getId()));
            $list_C_Achat = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Achat,'id_livreur'=>$this->getUser()->getId()));
            $list_C_Recuperation = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Recuperation,'id_livreur'=>$this->getUser()->getId()));
            $list_C_Faire = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Faire,'id_livreur'=>$this->getUser()->getId()));
            $list_C_Versement = $em->getRepository("DemandeBundle:Demande")->findBy(array('typeDC'=>DemandeTypeDCEnum::TYPE_Versement,'id_livreur'=>$this->getUser()->getId()));


        }


        $a = 0;
        $r1 = 0;
        $p = 0;
        $r2 = 0;
        $countAchat_Cousier = 0;
        $countRemise_Cousier = 0;

        $countFaire_Cousier = 0;
        $countVersement_Cousier = 0;
        $countReccuperation_Cousier = 0;

        $countXF = 0;



        foreach ($list_C_Faire as $l){
            $countFaire_Cousier = $countFaire_Cousier + 1;
        }


        foreach ($list_C_Versement as $l){
            $countVersement_Cousier = $countVersement_Cousier + 1;
        }


        foreach ($list_C_Recuperation as $l){
            $countReccuperation_Cousier = $countReccuperation_Cousier + 1;
        }



        foreach ($list_C_Achat as $l){
            $countAchat_Cousier = $countAchat_Cousier + 1;
        }

        foreach ($listAchat as $l){
            $a = $a + 1;
        }

        foreach ($list_C_Remise as $l){
            $countRemise_Cousier = $countRemise_Cousier + 1;
        }

        foreach ($listRemise as $l){
            $r1 = $r1 + 1;
        }


        foreach ($listPaiement as $l){
            $p = $p + 1;
        }

        foreach ($listRetour as $l){
            $r2 = $r2 + 1;
        }

        $pieChart->getData()->setArrayToDataTable(
            [['Type Demande', 'Nombre'],
                ['Achat',     $a+$countAchat_Cousier],
                ['Remise',      $r1+$countRemise_Cousier],
                ['Paiement',  $p],
                ['Faire', $countFaire_Cousier],
                ['Versement', $countVersement_Cousier],
                ['Reccuperation', $countReccuperation_Cousier],
                ['Retour', $r2]
            ]
        );
        $pieChart->getOptions()->getTitleTextStyle()->setBold(true);
        $pieChart->getOptions()->getTitleTextStyle()->setColor('#009900');
        $pieChart->getOptions()->getTitleTextStyle()->setFontName('Arial');
        $pieChart->getOptions()->getTitleTextStyle()->setFontSize(20);

        $user = $this->getUser();
        //  $jwtManager = $this->container->get('lexik_jwt_authentication.jwt_manager');

        $userId = $user->getId();

        // $this->get('session')->set('loginUserId', $this->getUser());


        $nb_users = $em->getRepository("UserBundle:User")->countAllUsers();
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN")){
            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemande();
            $listeR = $em->getRepository("ReclamationBundle:Reclamation")->dixDernierReclamation();
        }
        else if   ($this->isGranted("ROLE_CLIENT")){

            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemandeClient($userId);
            $listeR = $em->getRepository("ReclamationBundle:Reclamation")->dixDernierReclamationUser($userId);
        }
        else if  ($this->isGranted("ROLE_LIVREUR"))
        {
            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemandeLivreur($userId);
            $listeR = $em->getRepository("ReclamationBundle:Reclamation")->dixDernierReclamationUser($userId);


        }

        return $this->render('@Admin/Default/dahboard.html.twig', array('piechart' => $pieChart,'area' => $area,"nb_users"=>$nb_users,'listedemandes'=>$listeD,"listeRec" =>$listeR));
    }




    public function indexAction()
    {
        return new Response("sdfsd");
    }
    public function adminAction()
    {
        $em=$this->getDoctrine()->getManager();
        $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemande();


        // replace this example code with whatever you need
        return $this->render('@Admin/Default/admin.html.twig',array('listedemandes'=>$listeD));
    }

    public function clotureAction()
    {
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN"))
        {
            $nb_demande_cloture = $em->getRepository("DemandeBundle:Demande")->clotureAdmin();

        }
        else if ($this->isGranted("ROLE_CLIENT")){
            $nb_demande_cloture = $em->getRepository("DemandeBundle:Demande")->cloture($this->getUser()->getId(),"Cloture");

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_cloture = $em->getRepository("DemandeBundle:Demande")->clotureLivreur($this->getUser()->getId(),"Cloture");

        }
        return new Response($nb_demande_cloture);
    }


    public function findListAchatAction()
    {
        $em=$this->getDoctrine()->getManager();
        $listAchat = $em->getRepository("DemandeBundle:Demande")->clotureLivreur($this->getUser()->getId(),"Cloture");


    }
    public function demandeParMoisAction($date,$id)
    {
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN"))
        {
            $nb = $em->getRepository("DemandeBundle:Demande")->countDemandeParMois($date);

        }
        else if ($this->isGranted("ROLE_CLIENT")){
            $nb = $em->getRepository("DemandeBundle:Demande")->countDemandeParMoisClient($date,$id);

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb = $em->getRepository("DemandeBundle:Demande")->countDemandeParMoisLivreur($date,$id);

        }




        return $nb;
    }

    public function valideAction()
    {
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN"))
        {
            $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valideAdmin();

        }
        else if ($this->isGranted("ROLE_CLIENT")){
            $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valide($this->getUser()->getId(),"Valide");

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valideLivreur($this->getUser()->getId(),"Valide");

        }
        return new Response($nb_demande_valide);
    }



    public function enCoursAction()
    {
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN"))
        {
            $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCoursAdmin();

        }
        else if ($this->isGranted("ROLE_CLIENT")){
            $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCours($this->getUser()->getId(),"EnCours");

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCoursLivreur($this->getUser()->getId(),"EnCours");

        }
        return new Response($nb_demande_enCours);
    }

    public function enTraitementAction()
    {
        $em=$this->getDoctrine()->getManager();
        if ($this->isGranted("ROLE_ADMIN"))
        {

            $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitementAdmin();

        }
        else if ($this->isGranted("ROLE_CLIENT")){

            $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitement($this->getUser()->getId(),"EnTraitement");

        }
        else if ($this->isGranted("ROLE_LIVREUR")){

            $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitementLivreur($this->getUser()->getId(),"EnTraitement");

        }

        return new Response($nb_demande_enTraitement);
    }

    public function frontAction()
    {


        // replace this example code with whatever you need
        return $this->render('@Admin/Default/front.html.twig');
    }

}
