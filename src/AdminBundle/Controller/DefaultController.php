<?php

namespace AdminBundle\Controller;

use CMEN\GoogleChartsBundle\GoogleCharts\Charts\AreaChart;
use CMEN\GoogleChartsBundle\GoogleCharts\Charts\BarChart;
use CMEN\GoogleChartsBundle\GoogleCharts\Charts\PieChart;
use DemandeBundle\Enum\DemandeEtatEnum;
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
        $nbJuin = (int) $this->demandeParMoisAction("2019-06");
        $nb_Juillet = (int) $this->demandeParMoisAction("2019-07");
        $nb_Aout = (int) $this->demandeParMoisAction("2019-08");
        $nb_September = (int) $this->demandeParMoisAction("2019-09");
        $area = new AreaChart();
        $area->getData()->setArrayToDataTable([
            ['Mois', 'Demandes'],
            ['Juin',  $nbJuin],
            ['Juillet',  $nb_Juillet],
            ['Aout',  $nb_Aout]
        ]);
        $area->getOptions()->setTitle('Courbe de progression des demandes');
        $area->getOptions()->getHAxis()->setTitle('Mois');
        $area->getOptions()->getHAxis()->getTitleTextStyle()->setColor('#333');
        $area->getOptions()->getVAxis()->setMinValue(0);


        $pieChart = new PieChart();
        $listAchat = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Achat));
        $listRemise = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Remise));
        $listPaiement = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Paiement));
        $listRetour = $em->getRepository("DemandeBundle:Demande")->findBy(array('type'=>DemandeTypeEnum::TYPE_Retour));
        $a = 0;
        $r1 = 0;
        $p = 0;
        $r2 = 0;
        foreach ($listAchat as $l){
            $a = $a + 1;
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
                ['Achat',     $a],
                ['Remise',      $r1],
                ['Paiement',  $p],
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
        else{

            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemandeUser($userId);
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
            $nb_demande_cloture = $em->getRepository("DemandeBundle:Demande")->cloture($this->getUser()->getId());

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_cloture = $em->getRepository("DemandeBundle:Demande")->clotureLivreur($this->getUser()->getId());

        }
        return new Response($nb_demande_cloture);
    }

    public function demandeParMoisAction($date)
    {
        $em=$this->getDoctrine()->getManager();


            $nb = $em->getRepository("DemandeBundle:Demande")->countDemandeParMois($date);


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
            $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valide($this->getUser()->getId());

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valideLivreur($this->getUser()->getId());

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
            $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCours($this->getUser()->getId());

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCoursLivreur($this->getUser()->getId());

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
            $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitement($this->getUser()->getId());

        }

        else if ($this->isGranted("ROLE_LIVREUR")){
            $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitementLivreur($this->getUser()->getId());

        }
        return new Response($nb_demande_enTraitement);
    }

    public function frontAction()
    {


        // replace this example code with whatever you need
        return $this->render('@Admin/Default/front.html.twig');
    }

}
