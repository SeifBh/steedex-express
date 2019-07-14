<?php

namespace DemandeBundle\Controller;

use DemandeBundle\Entity\Demande;
use DemandeBundle\Form\AssignType;
use DemandeBundle\Form\DemandeType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use UserBundle\Entity\User;
use Spipu\Html2Pdf\Html2Pdf;


// Include Dompdf required namespaces
use Dompdf\Dompdf;
use Dompdf\Options;

class DefaultController extends Controller
{

    public function countNbMsg()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_unread_msgs = $em->getRepository("DemandeBundle:Demande")->countUnreadCol();
        return new Response($nb_unread_msgs);
    }

    public function listAction()
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();
        $userId = $user->getId();


        if ($this->isGranted("ROLE_ADMIN"))
        {
            $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array(), array('id' => 'DESC'));

        }
        elseif ($this->isGranted("ROLE_LIVREUR"))
        {
            $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array("id_livreur"=>$userId), array('id' => 'DESC'));

        }

        else{
            $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array("id_client"=>$userId), array('id' => 'DESC'));

        }


        return $this->render('@Demande/Default/index.html.twig', array(
            'listDemandes' => $listDemandes,
        ));

    }

    public function createAction(Request $request)
    {

        $user = $this->getUser();
        $userId = $user->getId();
        $demande = new Demande();

        $form = $this->createForm(DemandeType::class, $demande);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $demande->setEtat("EnTraitement");
                $demande->setReadDemande(false);
                $user_livreur = $em->getRepository("UserBundle:User")->find(33);
                //En Cours = Livreur = yousssef
                $demande->setIdLivreur($user_livreur);
                $demande->setEtat("Encours");
                //*******************************
                $demande->setIdClient($user);
                $demande->setDateEcheance(new \DateTime());

                $demande->setFraisLivraison(5);
                $em->persist($demande);
                $em->flush();

                return $this->redirectToRoute("_list_demande");
            } else {
                $errors = $this->get('validator')->validate($demande);

                return $this->render('@Demande/Default/create.html.twig', array(
                    'errrs', $errors,
                    'form' => $form->createView()
                ));

            }


        }
        return $this->render('@Demande/Default/create.html.twig', array(
            'form' => $form->createView()
        ));


    }


    public function updateAction(Request $request, $id)
    {

        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository("DemandeBundle:Demande")->find($id);
        $form = $this->createForm(DemandeType::class, $demande);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em->persist($demande);
            $em->flush();
            return $this->redirectToRoute('_list_demande');
        }


        return $this->render("@Demande/Default/update.html.twig", array(
            'form' => $form->createView()

        ));

    }

    public function removeAction(Request $request, $id)
    {

        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository("DemandeBundle:Demande")->find($id);
        if ($demande != null) {
            $em->remove($demande);
            $em->flush();
        }

        return $this->redirectToRoute("_list_demande");
    }


    public function affecterAction(Request $request, $id_demande)
    {
        $demande = new Demande();

        $form = $this->createForm(AssignType::class, $demande);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            $id_liveur = $request->get('id_livreur');
            return new Response($id_liveur);
        }

        $user = $this->getUser();
        $userId = $user->getId();
        $em = $this->getDoctrine()->getManager();
        /* if ($this->isGranted('ROLE_ADMIN')) {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();
         } else {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array('id_client'=>$userId));
         }
 */
        $listusers_livreur = $em->getRepository('UserBundle:User')->findByRole('ROLE_LIVREUR');
        $demande = $em->getRepository("DemandeBundle:Demande", $demande)->findBy(['id' => $id_demande]);
        ;

        return $this->render('@Demande/Default/assign.html.twig', array(
            'form' => $form->createView(),
            'demande' => $demande,
            'id_demande' => $id_demande,
            'listusers_livreur' => $listusers_livreur
        ));
    }


    public function confirmAssignAction(Request $request, $id_demande, $id_livreur)
    {

        $id_liveur = $request->get('id_livreur');
        $id_demande = $request->get('id_demande');
        $livreur = new User();
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $livreur = $em->getRepository('UserBundle:User')->findOneBy(array('id' => $id_livreur));
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));

        $demande->setIdLivreur($livreur);

        $demande->setEtat("Encours");
        $em->persist($demande);
        $em->flush();

        return $this->redirectToRoute("_list_demande");


    }

    public function valideDemandeAction(Request $request, $id_demande)
    {


        $id_demande = $request->get('id_demande');
        //return new Response($id_demande);
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));


        $demande->setEtat("Valide");
        $em->persist($demande);
        $em->flush();

        return $this->redirectToRoute("_list_demande");

    }


    public function viewPdfAction(Request $request){
        $id_demande = $request->get('id_demande');
        //return new Response($id_demande);
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));
        $id_demande = $demande->getId();
        $client = $demande->getIdClient();

        $html2pdf = new Html2Pdf('P','A4','en');
        $html2pdf->setTestIsImage(true);
        $ecole ="jj";
        return $this->render('@Admin/Default/pdf.html.twig',array('client'=>$client,'demande'=>$demande));


    }
    public function generatepdfAction(Request $request)
    {


        $id_demande = $request->get('id_demande');
        //return new Response($id_demande);
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));
        $id_demande = $demande->getId();
        $client = $demande->getIdClient();

        $html2pdf = new Html2Pdf('P','A4','en');
        $html2pdf->setTestIsImage(true);
        $ecole ="jj";
        $html = $this->render('@Admin/Default/pdf.html.twig',array('client'=>$client,'demande'=>$demande));

        $html2pdf->writeHTML($html);


        $html2pdf->output();




    }


    public function seenAction(Request $request){

        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $listedemandes = $em->getRepository('DemandeBundle:Demande')->findAll();





        if($request->isXmlHttpRequest()) {

            foreach ($listedemandes as $offset => $record) {
                $product = new Demande();
                $product = $em->getRepository("DemandeBundle:Demande")->findOneBy(['id' => $record->getId()]);
                $product->setReadDemande(true);
                $em->persist($product);
                $em->flush();



            }
            $em=$this->getDoctrine()->getManager();
            $nb_unread_Col = $em->getRepository("DemandeBundle:Demande")->countUnreadCol();



            $listspotted=$em->getRepository("DemandeBundle:Demande")->findAll();




            $normalizer = new ObjectNormalizer();

            $normalizer->setCircularReferenceLimit(2);
            // Add Circular reference handler
            $normalizer->setCircularReferenceHandler(function ($publication) {
                return $publication->getId();
            });
            $normalizers = array($normalizer);
            $serialzier = new Serializer(array($normalizer));
            $v = $serialzier->normalize($listspotted);



            return new JsonResponse($v);

        }


        return new JsonResponse("succes termine");





    }

    public function ajaxListAction(){

        //return new JsonResponse("Hello ");
        $publications = $this->getDoctrine()->getManager()->getRepository('UserBundle:User')->findOneBy(array('id'=>23),array('id'=>'DESC'))->getNom();
        $normalizer = new ObjectNormalizer();
        $normalizer->setCircularReferenceLimit(1);
        $normalizer->setCircularReferenceHandler(function ($listp) {
            return $listp->getId();
        });
        $normalizers = array($normalizer);
        $serialzier = new Serializer($normalizers);
        $l = $serialzier->normalize($publications);
      //  var_dump($l);
        return new JsonResponse($l);

    }

    public function allDemandeAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_demandes = $em->getRepository("DemandeBundle:Demande")->allDemandes();
        return new Response($nb_demandes);
    }


    public function removeAllAction(){
        $em=$this->getDoctrine()->getManager();

        $listedemandes = $em->getRepository("DemandeBundle:Demande")->findAll();


        foreach ($listedemandes as $offset => $record) {
            $product = new Demande();
            $product = $em->getRepository("DemandeBundle:Demande")->findOneBy(['id' => $record->getId()]);
            $em->remove($product);
            $em->flush();



        }
        return $this->redirectToRoute("_list_demande");


    }

}